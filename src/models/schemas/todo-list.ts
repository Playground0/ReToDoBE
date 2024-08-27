import mongoose from "mongoose";
import { TodoTaskSchema } from "./todo-task";

const TodoListSchema = new mongoose.Schema({
  listTitle: { type: String, required: true },
  userId: { type: String, required: true },
  sharedUsrID: { type: [String] },
  creationDate: { type: String, required: true },
  updationDate: { type: String, required: true },
  tasks: { type: [TodoTaskSchema], required: false },
  isDeleted: { type: Boolean, required: true },
  isHidden: { type: Boolean, required: true },
  isArchived: { type: Boolean, required: true },
});

export const TodoListModel = mongoose.model("TodoList", TodoListSchema);

export const createlist = (values: Record<string, any>) =>
  new TodoListModel(values).save().then((user) => user.toObject());
export const getLists = () => TodoListModel.find();
export const getListById = (listId: string, userId: string) =>
  TodoListModel.findOne({ _id: listId, userId: userId });
export const getListByName = (listname: string, userId: string) =>
  TodoListModel.findOne({ listTitle: listname, userId: userId });
export const getListByNameIfLive = (listname: string, userId: string) =>
  TodoListModel.findOne({
    listTitle: listname,
    userId: userId,
    isDeleted: false,
    isArchived: false,
    isHidden: false,
  });
export const updateListByID = (id: string, values: Record<string, any>) =>
  TodoListModel.findByIdAndUpdate(id, values);
export const getListsByUser = (userId: string) =>
  TodoListModel.find({
    userId: userId,
    isArchived: false,
    isDeleted: false,
    isHidden: false,
  });
export const archivedLists = (userId: string) =>
  TodoListModel.find({ userId: userId, isArchived: true });
export const deletedLists = (userId: string) =>
  TodoListModel.find({ userId: userId, isDeleted: true });
export const hiddenLists = (userId: string) =>
  TodoListModel.find({ userId: userId, isHidden: true });
export const getStashedListByUser = (
  userId: string,
  isArchived = false,
  isDeleted = false,
  isHidden = false
) =>
  TodoListModel.find({
    userId: userId,
    isArchived: isArchived,
    isDeleted: isDeleted,
    isHidden: isHidden,
  });
export const deleteListById = (id: string) =>
  TodoListModel.findOneAndDelete({ _id: id });
