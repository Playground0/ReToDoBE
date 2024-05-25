import mongoose from "mongoose";

const AppConfigSchema = new mongoose.Schema({
  type: { type: String, required: true },
  configName: { type: String, required: true },
  desc: { type: String, required: true },
  value: { type: [{}], required: true },
  creationDate: { type: String, required: true },
  updatationDate: { type: String, required: true },
  createBy: { type: String, required: true },
  createdById: { type: String, required: true },
  isActive: { type: Boolean, required: true },
});

export const AppConfigModel = mongoose.model(
  "admin-config",
  AppConfigSchema
);

export const createConfigurations = (values: Record<string, any>) =>
  new AppConfigModel(values).save().then((user) => user.toObject());
export const getConfigurationById = (id: string) =>
  AppConfigModel.findOne({ _id: id });
export const getConfigurationByName = (name: string) =>
  AppConfigModel.findOne({ configName: name });
export const getConfigurationsByType = (type: string) =>
  AppConfigModel.find({ type: type, isActive: true });
export const getInactiveConfigurations = () =>
  AppConfigModel.find({ isActive: false });
export const getConfigurationsByUsername = (username: string) =>
  AppConfigModel.find({ createBy: username });
export const getConfigurationsByUserId = (id: string) =>
  AppConfigModel.find({ createdById: id });
export const updateConfigurationByID = (
  id: string,
  values: Record<string, any>
) => AppConfigModel.findByIdAndUpdate(id, values);
export const deleteConfigById = (id:string) => AppConfigModel.findOneAndDelete({_id:id})
export const deleteConfigByName = (name:string) => AppConfigModel.findOneAndDelete({configName:name})

