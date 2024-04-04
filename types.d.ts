import { Request } from 'express';
import { User } from 'src/auth/user.schema';

type userRequest = Request & { user: User };
