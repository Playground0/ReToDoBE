import mongoose from "mongoose";
import { endOfToday, startOfToday } from "../../utils/date-converter";

export const TodoTaskSchema = new mongoose.Schema({
  currentListId: { type: String, required: true },
  previousListID: { type: String, required: true },
  userId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  creationDate: { type: String, required: true },
  updationDate: { type: String, required: true },
  taskStartDate: { type: String, required: false },
  taskEndDate: { type: String, required: false },
  taskDesc: { type: String, required: false },
  occurance: { type: String, required: false },
  priority: { type: Number, required: false },
  reminder: { type: Boolean, required: false },
  isRecurring: { type: Boolean, required: false },
  isCompleted: { type: Boolean, required: false },
  isDeleted: { type: Boolean, required: false },
  isArchived: { type: Boolean, required: false },
  isDeletedWithList: { type: Boolean, required: false },
  isArchivedWithList: { type: Boolean, required: false },
  isHiddenWithList: { type: Boolean, required: false },
});

export const TodoTaskModel = mongoose.model("TodoTask", TodoTaskSchema);

// export const createTask = (values: Record<string, any>) =>
//   new TodoTaskModel(values).save().then((task) => task.toObject());

export const createTask = (values: Record<string, any>[]) =>
  TodoTaskModel.insertMany(values).then((savedTasks) =>
    savedTasks.map((task) => task.toObject())
  );

export const getTaskById = (id: string, userId: string) =>
  TodoTaskModel.findOne({ _id: id, userId: userId });

export const getTaskByName = (taskName: string, userId: string) =>
  TodoTaskModel.findOne({ listTitle: taskName, userId: userId });

export const getTaskByUser = (userId: string) =>
  TodoTaskModel.find({ userId: userId });

export const getInboxTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
  });

export const getDeletedTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isDeleted: true,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getArchivedTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isArchived: true,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getCompletedTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isCompleted: true,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getRecurringTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isRecurring: true,
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getTodayTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    taskEndDate: {
      $gte: startOfToday(),
      $lte: endOfToday(),
    },
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getUpcommingTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    taskEndDate: {
      $gt: endOfToday(),
    },
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
    isDeletedWithList: false,
    isArchivedWithList: false,
    isHiddenWithList: false,
  });

export const getCustomListTasks = (
  userId: string,
  listId: string,
  isDeletedWithList = false,
  isArchivedWithList = false,
  isHiddenWithList = false
) =>
  TodoTaskModel.find({
    userId: userId,
    currentListId: listId,
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
    isArchivedWithList: isArchivedWithList,
    isDeletedWithList: isDeletedWithList,
    isHiddenWithList: isHiddenWithList,
  });

export const updateTaskByID = (id: string, values: Record<string, any>) =>
  TodoTaskModel.findByIdAndUpdate(id, values);

export const deleteTaskById = (id: string) =>
  TodoTaskModel.findOneAndDelete({ _id: id });

export const searchResults = (searchQuery: string, userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    taskTitle: { $regex: searchQuery, $options: "i" },
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
    isArchivedWithList: false,
    isDeletedWithList: false,
    isHiddenWithList: false,
  });
