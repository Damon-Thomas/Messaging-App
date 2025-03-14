import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import contactQueries from "../models/contactQueries";

// const getActiveUserContacts = asyncHandler(async (req, res) => {
const getActiveUserContacts = async (req, res) => {
  if (!req.user.id) {
    return res.status(400).json({ failure: true, message: "User not found" });
  }
  try {
    const users = await contactQueries.getCurrentConversationUsers(req.user.id);
    res.status(200).json({ users, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
};

const getUserGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await contactQueries.getGroupsUserHasJoined(userId);
    res.status(200).json({ groups, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
});

const getGroupMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  if (!groupId) {
    return res
      .status(400)
      .json({ failure: true, message: "Group not found", received: req.body });
  }
  try {
    const members = await contactQueries.getGroupMembers(groupId);
    res.status(200).json({ members, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
});

const getFriendsList = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const friends = await contactQueries.getFriendsList(userId);
    res.status(200).json({ friends, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
});
const getNonContactUsers = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page } = req.body || 1;
  try {
    const users = await contactQueries.getNonContactUsers(userId, page);
    res.status(200).json({ users, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
});

const getNonJoinedGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page } = req.body || 1;
  try {
    const groups = await contactQueries.getNonJoinedGroups(userId, page);
    res.status(200).json({ groups, failure: false });
  } catch (error) {
    res.status(400).json({ message: error.message, error, failure: true });
  }
});

export default {
  getActiveUserContacts,
  getFriendsList,
  getUserGroups,
  getGroupMembers,
  getNonContactUsers,
  getNonJoinedGroups,
};
