import { Router } from "express";
import userController from "../controllers/userController.js";
import actionController from "../controllers/actionController.js";
import { messageValidator } from "./validators/messageValidators.js";

const router = Router();

router.post(
  "/createMessage",
  messageValidator,
  userController.verifyToken,
  userController.authUser,
  actionController.sendMessage as any
);

router.post(
  "/likeMessage",
  userController.verifyToken,
  userController.authUser,
  actionController.likeMessage as any
);

router.delete(
  "/unLikeMessage",
  userController.verifyToken,
  userController.authUser,
  actionController.unLikeMessage as any
);

router.post(
  "/addFriend",
  userController.verifyToken,
  userController.authUser,
  actionController.addFriend as any
);

router.delete(
  "/removeFriend",
  userController.verifyToken,
  userController.authUser,
  actionController.deleteFriend as any
);

router.post(
  "/createGroup",
  userController.verifyToken,
  userController.authUser,
  actionController.makeGroup as any
);

router.post(
  "/joinGroup",
  userController.verifyToken,
  userController.authUser,
  actionController.joinGroup as any
);

router.delete(
  "/leaveGroup",
  userController.verifyToken,
  userController.authUser,
  actionController.leaveGroup as any
);

router.delete(
  "/deleteGroup",
  userController.verifyToken,
  userController.authUser,
  actionController.deleteGroup as any
);

router.put(
  "/setPinnedMessage",
  userController.verifyToken,
  userController.authUser,
  actionController.setPinnedMessage as any
);

router.delete(
  "/deletePinnedMessage",
  userController.verifyToken,
  userController.authUser,
  actionController.deletePinnedMessage as any
);

export default router;
