import {
  CreatePlaylistRequest,
  PopulateFavList,
  updatePlaylistRequest,
} from "#/@types/collection";
import CardsCollection from "#/models/cardsCollection";
import Playlist from "#/models/playlist";
import PlaylistCollection from "#/models/playlistCollection";
import { RequestHandler } from "express";
import { isValidObjectId, Types } from "mongoose";
import { array } from "yup";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;
  const ownerId = req.user.id;
  if (resId) {
    const cardsCollection = await CardsCollection.findById(resId);
    if (!cardsCollection) {
      res.status(404).json({
        error: "collection not found ",
        message: "collection does not exit",
      });
      return;
    }
  }

  const newPlaylist = new Playlist({
    title,
    owner: ownerId,
    visibility,
  });
  //   const newId = new Types.ObjectId(resId)
  if (resId) newPlaylist.items = [resId as any];
  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
};
// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// export const updatePlaylist: RequestHandler = async (
//   req: updatePlaylistRequest,
//   res
// ) => {
//   const { id, item, title, visibility } = req.body;
//   const playlist = await Playlist.findOneAndUpdate(
//     { _id: id, owner: req.user.id },
//     { title, visibility },
//     { new: true }
//   );
//   if (!playlist) {
//     res.status(404).json({
//       error: "playlist not found!",
//       message: "playlist not found",
//     });
//     return;
//   }

//   if (item) {
//     const cardsCollection = await CardsCollection.findById(item);
//     if (!cardsCollection) {
//       res.status(404).json({
//         error: "cardsCollection not found!",
//         message: "cards Collection not found",
//       });
//       return;
//     }
//     // playlist.items.push(cardsCollection._id);
//     // await playlist.save();
//     await Playlist.findByIdAndUpdate(playlist._id, {
//       $addToSet: { items: item },
//     });
//   }
//   res.status(201).json({
//     playlist: {
//       id: playlist._id,
//       title: playlist.title,
//       visibility: playlist.visibility,
//     },
//   });
// };

export const updatePlaylist: RequestHandler = async (
  req: updatePlaylistRequest,
  res
) => {
  const { id, item, title, visibility } = req.body;
  const ownerId = req.user.id;

  try {
    // 1. Update the playlist's title and visibility
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, owner: ownerId },
      { title, visibility },
      { new: true }
    );

    if (!playlist) {
      res.status(404).json({
        error: "playlist not found!",
        message: "playlist not found",
      });
      return;
    }

    // 2. Add the new item to the playlist (if provided)
    if (item) {
      const cardsCollection = await CardsCollection.findById(item);
      if (!cardsCollection) {
        res.status(404).json({
          error: "cardsCollection not found!",
          message: "cards Collection not found",
        });
        return;
      }

      await Playlist.findByIdAndUpdate(playlist._id, {
        $addToSet: { items: item },
      });
    }

    // 3. Fetch the updated playlist with items
    const updatedPlaylist = await Playlist.findById(id).populate<{
      items: PopulateFavList[];
    }>("items");
    // console.log("updated-playlist", updatedPlaylist);
    if (!updatedPlaylist) {
      res.status(500).json({
        error: "Failed to fetch updated playlist",
        message: "Failed to fetch updated playlist",
      });
      return;
    }

    // 4. Extract all cards from the collections in the playlist
    let allCards: any[] = [];
    let posterUrl: string | undefined;

    if (updatedPlaylist?.items.length > 0) {
      // Use the poster of the first collection as the playlist's poster
      posterUrl = updatedPlaylist.items[0].poster?.url;

      // Fetch all cards from each collection
      for (const collection of updatedPlaylist.items) {
        const cardCollection = await CardsCollection.findById(
          collection._id
        ).populate({
          path: "cards",
          select: "_id answer question collectionId",
        });

        if (cardCollection) {
          allCards = allCards.concat(cardCollection?.cards);
        }
      }
    }

    // 5. Shuffle the cards
    const shuffledCards = shuffleArray(allCards);
    let newCollection;
    // 6. Create a new collection with the playlist's title and shuffled cards
    if (!updatedPlaylist?.main) {
      newCollection = new PlaylistCollection({
        title: title,
        description: `Auto-generated collection from ${title} playlist`,
        poster: { url: posterUrl },
        owner: ownerId,
        visibility: "public", // Or whatever visibility you want
        cards: shuffledCards.map((card) => card._id),
      });
      await newCollection.save();
    } else {
      newCollection = await PlaylistCollection.findByIdAndUpdate(
        updatedPlaylist.main,
        { cards: shuffledCards.map((card) => card._id) },
        { new: true }
      );
    }

    const locatedCollection = await PlaylistCollection.findById(
      newCollection?._id
    );

    // 7. Update the playlist with the new collection's ID
    if (locatedCollection) {
      const latest = await Playlist.findByIdAndUpdate(playlist._id, {
        main: locatedCollection?._id,
      });
      res.status(201).json({
        playlist: {
          id: latest?._id,
          title: latest?.title,
          main: latest?.main,
          visibility: latest?.visibility,
        },
      });
    }

    // 8. Respond with the new collection's data
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update playlist",
    });
  }
};
export const removePlaylist: RequestHandler = async (req, res) => {
  const { playlistId, resId, all } = req.query;
  if (!isValidObjectId(playlistId)) {
    res
      .status(422)
      .json({ error: "invalid playlist id!", message: "invalid playlist id" });
  }
  const playlist = await Playlist.findOne({
      _id: playlistId,
      owner: req.user.id,
    });
    if(playlist?.main) {
      // delete the main collection for the playlist 
     await PlaylistCollection.findOneAndDelete(playlist.main);
    }else if (!playlist) {
    res.status(404).json({
      error: "playlist not found!",
      message: "the requested playlist does not exist",
    });}

  if (all === "yes") {
    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user.id,
    });

    if (!playlist) {
      res.status(404).json({
        error: "playlist not found!",
        message: "the requested playlist does not exist",
      });
      return;
    }
  }
  if (resId) {
    if (!isValidObjectId(resId)) {
      res.status(422).json({
        error: "invalid playlist id!",
        message: "invalid playlist id",
      });
    }
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user.id,
      },
      {
        $pull: { items: resId },
      }
    );

    if (!playlist) {
      res.status(404).json({
        error: "playlist not found",
        message: "requested playlist doesn't exist",
      });
      return;
    }
  }
  res.json({
    success: true,
  });
};
export const getPlaylistByProfile: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as {
    pageNo: string;
    limit: string;
  };
  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");
  const playlist = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });
  res.json({ playlist });
};
export const getPlaylist: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    res.status(422).json({
      error: "invalid playlist id ",
      message: "playlistId is not valid ",
    });
    return;
  }
  const playlist = await Playlist.findOne({
    owner: req.user.id,
    _id: playlistId,
  }).populate<{ items: PopulateFavList[] }>({
    path: "items",
    populate: {
      path: "owner",
      select: "name",
    },
  });

  if (!playlist) {
    res.json({ list: [] });
    return;
  }
  const collection = playlist.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      poster: item?.poster?.url,
      owner: {
        name: item.owner.name,
        id: item.owner._id,
      },
    };
  });
  res.json({
    list: {
      id: playlist._id,
      title: playlist.title,
      main: playlist?.main,
      collection,
    },
  });
};
