// routes/auth/login.ts

import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { UserModel } from '@/libs/models/user.model';
import dbConnect from '@/libs/dbConnect';
import { sendSuccessResponse, sendErrorResponse } from '@/libs/response';
import { LoginValidation } from '@/libs/validation/LoginValidation';

/**
 * Handles the HTTP POST request for user login.
 *
 * This function authenticates a user by validating the provided email and password,
 * checking if the user exists, and comparing the hashed password.
 *
 * @param {Request} req - The HTTP request containing user login data.
 * @returns {NextResponse} - The HTTP response with relevant status and message.
 */
export const POST = async (req: Request) => {
  await dbConnect();

  try {
    // Extract email and password from the request body
    const { email, password } = await req.json();

    const loginValidation = new LoginValidation();
    loginValidation.email = email;
    loginValidation.password = password;

    // Validate user input using class-validator
    const validationErrors = await loginValidation.validate();

    if (validationErrors) {
      const errorResponse = sendErrorResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Validation failed',
      );
      return NextResponse.json(errorResponse, { status: StatusCodes.UNPROCESSABLE_ENTITY });
    }

    // Check if the user exists
    const user = await UserModel.findOne({ email });

    if (!user) {
      const errorResponse = sendErrorResponse(StatusCodes.UNAUTHORIZED, 'User not found');
      return NextResponse.json(errorResponse, { status: StatusCodes.UNAUTHORIZED });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const errorResponse = sendErrorResponse(StatusCodes.UNAUTHORIZED, 'Invalid password');
      return NextResponse.json(errorResponse, { status: StatusCodes.UNAUTHORIZED });
    }

    // Return a JSON response with the authenticated user and a success status code
    const successResponse = sendSuccessResponse(user);
    return NextResponse.json(successResponse, { status: StatusCodes.OK });
  } catch (error) {
    console.error(error);

    // Return a JSON response for server error with an appropriate status code
    const errorResponse = sendErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
    return NextResponse.json(errorResponse, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};
