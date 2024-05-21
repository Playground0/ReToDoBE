import mongoose from "mongoose";

export const TodoTaskSchema = new mongoose.Schema({
  currentListId: { type: String, required: true },
  previousListID: { type: String, required: true },
  userId: { type: String, required: true },
  taskTitle: { type: String, required: true },
  creationDate: { type: String, required: true },
  updationDate: { type: String, required: true },
  taskStartDate: { type: String, required: true },
  taskEndDate: { type: String, required: false },
  taskDesc: { type: String, required: false },
  occurance: { type: String, required: false },
  priority: { type: Number, required: false },
  reminder: { type: Boolean, required: false },
  isRecurring: { type: Boolean, required: false },
  isCompleted: { type: Boolean, required: false },
  isDeleted: { type: Boolean, required: false },
  isArchived: { type: Boolean, required: false },
});

export const TodoTaskModel = mongoose.model("TodoTask", TodoTaskSchema);

export const createTask = (values: Record<string, any>) =>
  new TodoTaskModel(values).save().then((user) => user.toObject());

export const getTaskById = (id: string, userId: string) =>
  TodoTaskModel.findOne({ _id: id, userId: userId });

export const getTaskByName = (taskName: string, userId: string) =>
  TodoTaskModel.findOne({ listTitle: taskName, userId: userId });

export const getTaskByUser = (userId: string) =>
  TodoTaskModel.find({ userId: userId });

export const getInboxTasks = (userId: string) =>
  TodoTaskModel.find({
    userId: userId,
    isCompleted: false,
    isArchived: false,
    isDeleted: false,
  });

export const getDeletedTasks = (userId: string) =>
  TodoTaskModel.find({ userId: userId, isDeleted: true });

export const getArchivedTasks = (userId: string) =>
  TodoTaskModel.find({ userId: userId, isArchived: true });

export const getCompletedTasks = (userId: string) =>
  TodoTaskModel.find({ userId: userId, isCompleted: true });

export const getRecurringTasks = (userId: string) =>
  TodoTaskModel.find({ userId: userId, isRecurring: true });

export const updateTaskByID = (id: string, values: Record<string, any>) =>
  TodoTaskModel.findByIdAndUpdate(id, values);

export const deleteTaskById = (id: string) =>
  TodoTaskModel.findOneAndDelete({ _id: id });
