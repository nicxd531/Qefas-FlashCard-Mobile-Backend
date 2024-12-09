import { ObjectId } from "mongoose";
import {CardsCollectionDocument} from "../models/cardsCollection"


export type PopulateFavList= CardsCollectionDocument<{
    _id:ObjectId,name:string,avatar:string,followers:ObjectId[],followings:ObjectId[]
}>[]