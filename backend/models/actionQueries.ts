import prisma from "./client.js";
import userQueries from "./userQueries.js";

const sendMessage = async (
  userId: string,
  message: string,
  username: string,
  sentTo: string,
  destinationType: "user" | "group",
  pinned: boolean = false
) => {
  console.log("sendMessage", userId, message, sentTo, destinationType, pinned);
  if (destinationType === "user" && sentTo === userId) {
    return { message: "Cannot send message to self", failure: true };
  }
  if (destinationType === "user") {
    console.log("id of sent to", sentTo);
    const user = await userQueries.getUserById(sentTo);
    console.log("user", user);
    if (!user) {
      return { message: "User not found", failure: true };
    }
  } else if (destinationType === "group") {
    const group = await prisma.group.findUnique({
      where: { id: sentTo },
    });
    if (!group) {
      return { message: "Group not found", failure: true };
    }
  }
  const newMessage = await prisma.message.create({
    data: {
      authorId: userId,
      username: username,
      content: message,
      sentToId: destinationType === "user" ? sentTo : null,
      sentToGroupId: destinationType === "group" ? sentTo : null,
      PinnedMessage: pinned,
    },
  });
  return { ...newMessage, failure: false };
};

const setPinnedMessage = async (
  userId: string,
  username: string,
  groupId: string,
  content: string
) => {
  const pinnedMessageVerifier = await prisma.group.findUnique({
    where: { id: groupId, administratorId: userId },
  });
  if (!pinnedMessageVerifier) {
    return { message: "User is not the group administrator!", failure: true };
  }
  const updatedGroup = await prisma.group.update({
    where: { id: groupId },
    data: {
      PinnedMessage: {
        upsert: {
          // create the pinned message if it doesn't exist
          create: {
            content: content,
            authorId: userId,
            username: username,
            // You can optionally fill in other required fields (e.g. filename, filePath, etc.)
          },
          // update the pinned message if it already exists
          update: {
            content: content,
          },
        },
      },
    },
    include: {
      PinnedMessage: true,
    },
  });
  return { pinnedMessage: updatedGroup.PinnedMessage, failure: false };
};

const deletePinnedMessage = async (userId: string, groupId: string) => {
  const pinnedMessageVerifier = await prisma.group.findUnique({
    where: { id: groupId, administratorId: userId },
  });
  if (!pinnedMessageVerifier) {
    return { message: "User is not the group administrator!", failure: true };
  }

  const pinnedMessage = await prisma.group.update({
    where: { id: groupId },
    data: { PinnedMessage: { disconnect: true } },
  });
  return { pinnedMessage, failure: false };
};

const likeMessage = async (userId: string, messageId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message) {
    return { message: "Message not found", failure: true };
  }
  const likeChecker = await prisma.messageLikes.findFirst({
    where: {
      userId: userId,
      messageId: messageId,
    },
  });
  if (likeChecker) {
    return { message: "Message already liked", failure: true };
  }
  const newLike = await prisma.messageLikes.create({
    data: { userId: userId, messageId: messageId },
  });
  return { newLike, failure: false };
};

const unLikeMessage = async (userId: string, messageId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message) {
    return { message: "Message not found", failure: true };
  }
  const likeChecker = await prisma.messageLikes.findFirst({
    where: { userId: userId, messageId: messageId },
  });
  if (!likeChecker) {
    return { message: "Message not liked", failure: true };
  }
  const likeDeleter = await prisma.messageLikes.delete({
    where: {
      userId_messageId: { userId, messageId },
    },
  });
  return { likeDeleter, failure: false };
};

const addFriend = async (userId: string, friendId: string) => {
  const friend = await userQueries.getUserById(friendId);
  if (!friend) {
    return { message: "Friend not found", failure: true };
  }

  // Use upsert to either insert if the record does not exist.
  const friendMaker = await prisma.userFriend.upsert({
    where: {
      userId_friendId: { userId: userId, friendId: friendId },
    },
    update: {}, // No update since record exists
    create: { userId, friendId },
  });
  return { friendMaker, failure: false };
};

const deleteFriend = async (userId: string, friendId: string) => {
  const friend = await userQueries.getUserById(friendId);
  if (!friend) {
    return { message: "Friend not found", failure: true };
  }
  const friendDeleter = await prisma.userFriend.delete({
    where: { userId_friendId: { userId, friendId } },
  });
  return { friendDeleter, failure: false };
};

const joinGroup = async (userId: string, groupId: string) => {
  // Use upsert with the composite key (assuming it's defined as groupId_userId)
  const group = await prisma.userGroup.upsert({
    where: {
      userId_groupId: { userId, groupId },
    },
    update: {}, // No update because the record exists
    create: { userId, groupId },
  });
  return { group };
};

const leaveGroup = async (userId: string, groupId: string) => {
  const group = await prisma.userGroup.delete({
    where: { userId_groupId: { groupId, userId } },
  });
  return { group };
};

const createGroup = async (groupName: string, administratorId: string) => {
  const groupExists = await prisma.group.findFirst({
    where: { groupName },
  });
  if (groupExists) {
    return { message: "Group already exists", failure: true };
  }
  const group = await prisma.group.create({
    data: { groupName, administratorId },
  });
  return { group, failure: false };
};

const deleteGroup = async (groupId: string, userId: string) => {
  if (!groupId || !userId) {
    return { message: "Invalid input", failure: true };
  }

  const administratorId = await prisma.group.findUnique({
    where: { id: groupId },
    select: { administratorId: true },
  });
  if (!administratorId || administratorId.administratorId !== userId) {
    return { message: "User is not the group administrator!", failure: true };
  }

  if (!administratorId) {
    return { message: "Group not found", failure: true };
  }

  if (administratorId.administratorId === userId) {
    await prisma.userGroup.deleteMany({
      where: { groupId },
    });
    await prisma.group.delete({
      where: { id: groupId },
    });
    return { message: "Group deleted", failure: false };
  }
};

export default {
  sendMessage,
  likeMessage,
  unLikeMessage,
  addFriend,
  deleteFriend,
  joinGroup,
  leaveGroup,
  createGroup,
  deleteGroup,
  setPinnedMessage,
  deletePinnedMessage,
};
