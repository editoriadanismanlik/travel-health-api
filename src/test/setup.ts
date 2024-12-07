import mongoose from 'mongoose';
import { config } from '../config/config';

beforeAll(async () => {
  await mongoose.connect(config.mongodb.uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map(collection => collection.deleteMany({})));
  }
});
