import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import profileQueries from "../models/profileQueries";
import { Request, Response } from "express";

export interface UserRequest extends Request {
  user: {
    id: string;
  };
}

interface Profile {
  color: string;
  profilePic: string | null;
  bio: string;
  intro: string;
}

const getProfile = async (req: UserRequest, res: Response): Promise<void> => {
  console.log(req.user.id);
  const profile: Profile | null = await profileQueries.getProfile(req.user.id);
  if (profile) {
    res.status(200).json({ ...profile, failure: false });
  } else {
    res.status(404).json({ message: "Profile not found", failure: true });
  }
};

//fix this
const updateProfile = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array(), failure: true });
    return;
  }

  const profile = {
    color: req.body.color,
    profilePic: req.body.profilePic,
    bio: req.body.bio,
    intro: req.body.intro,
  };

  const updatedProfile = await profileQueries.updateProfile(
    req.user.id,
    profile
  );
  if (updatedProfile) {
    res.status(200).json({ ...updatedProfile, failure: false });
  } else {
    res.status(404).json({ message: "Profile not found", failure: true });
  }
};

export default {
  getProfile,
  updateProfile,
};
