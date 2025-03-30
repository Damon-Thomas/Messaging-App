import prisma from "./client.js";

const getCurrentConversationUsers = async (userId: string, page: number) => {
  const takeStart = (page - 1) * 10;

  // Use a single query with UNION via Prisma's raw query capabilities
  // This is more efficient than two separate queries
  const conversationUsers = await prisma.message.findMany({
    where: {
      OR: [{ authorId: userId, sentToId: { not: null } }, { sentToId: userId }],
    },
    select: {
      author: {
        select: {
          id: true,
          username: true,
          lastLogin: true,
        },
      },
      sentTo: {
        select: {
          id: true,
          username: true,
          lastLogin: true,
        },
      },
    },
    distinct: ["sentToId", "authorId"],
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    skip: takeStart,
  });

  // Process the results to get unique users
  const uniqueUsers = new Map();

  conversationUsers.forEach((message) => {
    // Add the user who is not the current user
    if (message.author?.id !== userId && message.author) {
      uniqueUsers.set(message.author.id, message.author);
    }
    if (message.sentTo?.id !== userId && message.sentTo) {
      uniqueUsers.set(message.sentTo.id, message.sentTo);
    }
  });
  const result = Array.from(uniqueUsers.values());
  console.log("result i need RN", result);
  return result;
};

const getGroupsUserHasJoined = async (userId: string, page: number) => {
  const takeStart = (page - 1) * 10;
  return await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    take: 10,
    skip: takeStart,
    orderBy: {
      Message: {
        _count: "desc",
      },
    },
  });
};

const getGroupMembers = async (groupId: string) => {
  return await prisma.userGroup.findMany({
    where: {
      groupId: groupId,
    },
    select: {
      user: true,
    },
  });
};

const getFriendsList = async (userId: string) => {
  const friends = await prisma.user.findMany({
    where: {
      id: userId,
    },
    select: {
      friends: {
        select: {
          friend: {
            select: {
              id: true,
              username: true,
              lastLogin: true,
            },
          },
        },
      },
    },
  });

  return friends[0].friends.map((friend) => friend.friend);
};

const getNonContactUsers = async (userId: string, page: number) => {
  const takeStart = (page - 1) * 10;
  const friends = await prisma.user.findMany({
    where: {
      id: userId,
    },
    select: {
      friends: true,
    },
  });
  const friendIds: string[] = [];
  if (friends && friends.length > 0) {
    friends[0].friends.forEach((friend) => {
      friendIds.push(friend.friendId);
    });
  }
  return await prisma.user.findMany({
    where: {
      id: {
        not: userId,
        notIn: friendIds,
      },
    },
    take: 10,
    skip: takeStart,
  });
};

const getNonJoinedGroups = async (userId: string, page: number) => {
  const takeStart = (page - 1) * 10;
  return await prisma.group.findMany({
    where: {
      members: {
        none: {
          userId: userId,
        },
      },
    },
    take: 10,
    skip: takeStart,
    orderBy: {
      Message: {
        _count: "desc",
      },
    },
  });
};

const getUserContacts = async (userId: string) => {
  return await prisma.user.findMany({
    where: {
      id: userId,
    },
    select: {
      groups: true,
      friends: true,
    },
  });
};

export default {
  getUserContacts,
  getGroupsUserHasJoined,
  getFriendsList,
  getCurrentConversationUsers,
  getGroupMembers,
  getNonContactUsers,
  getNonJoinedGroups,
};
