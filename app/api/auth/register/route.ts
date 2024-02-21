import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '@/libs/models/user.model';
import dbConnect from '@/libs/dbConnect';
import { UserValidation } from '@/libs/validation/UserValidation';
import { sendSuccessResponse, sendErrorResponse } from '@/libs/response';

/**
 * Handles the HTTP POST request for user registration.
 *
 * This function registers a new user by validating the provided email and password,
 * checking if the email is already taken, and creating a new user in the database.
 *
 * @param {Request} req - The HTTP request containing user registration data.
 * @returns {NextResponse} - The HTTP response with relevant status and message.
 */
export const POST = async (req: Request) => {
  await dbConnect();

  try {
    // Extract email and password from the request body
    const { name, email, password } = await req.json();

    const userValidation = new UserValidation();
    userValidation.name = name;
    userValidation.email = email;
    userValidation.password = password;

    // Validate user input using class-validator
    const validationErrors = await userValidation.validate();

    if (validationErrors) {
      const errorResponse = sendErrorResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        validationErrors[0],
      );
      return NextResponse.json(errorResponse, { status: StatusCodes.UNPROCESSABLE_ENTITY });
    }

    // Check if the email is already taken
    const isEmailTaken = await userExists(email);
    if (isEmailTaken) {
      const errorResponse = sendErrorResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Email is already taken',
      );
      return NextResponse.json(errorResponse, { status: StatusCodes.UNPROCESSABLE_ENTITY });
    }

    // Hash the password using bcrypt
    const hashedPassword = await hashPassword(password);

    // Create a new user using the UserModel
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      provider: 'credentials',
    });

    // Return a JSON response with the created user and a success status code
    const successResponse = sendSuccessResponse(user);
    return NextResponse.json(successResponse, { status: StatusCodes.CREATED });
  } catch (error) {
    console.error(error);

    // Return a JSON response for server error with an appropriate status code
    const errorResponse = sendErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
    return NextResponse.json(errorResponse, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Checks if a user with the given email already exists in the database.
 *
 * @param {string} email - The email to check for existing users.
 * @returns {Promise<boolean>} - A promise resolving to whether the user with the email exists.
 * @throws Throws an error if there is an issue checking the user existence.
 */
const userExists = async (email: string): Promise<boolean> => {
  try {
    // Find a user with the given email in the UserModel
    const existingUser = await UserModel.findOne({ email });

    // Return whether the user exists
    return Boolean(existingUser);
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

/**
 * Hashes a password using bcrypt.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - A promise resolving to the hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
  // Set the number of salt rounds for bcrypt
  const saltRounds = 10;

  // Return the hashed password using bcrypt
  return bcrypt.hash(password, saltRounds);
};
