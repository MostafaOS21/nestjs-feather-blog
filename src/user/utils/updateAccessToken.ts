import { User } from 'src/auth/user.schema';
import { sign } from 'jsonwebtoken';

export const updateAccessToken = (
  user: User,
): {
  accessToken: string;
  user_id: string;
} => {
  const userData = {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    blogsPublished: user.blogsPublished,
    reads: user.reads,
  };

  return {
    accessToken: `Bearer ${sign(userData, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })}`,
    user_id: user._id.toString(),
  };
};
