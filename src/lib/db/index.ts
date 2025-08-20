import { withAccelerate } from '@prisma/extension-accelerate'
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client'

config(); // Load environment variables from .env file

const prisma = new PrismaClient().$extends(withAccelerate())

export default prisma;
