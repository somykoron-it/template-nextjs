import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/libs/models/user.model';
import dbConnect from '@/libs/dbConnect';
import { sendSuccessResponse, sendErrorResponse } from '@/libs/response';
import Cryptr from 'cryptr';
import Env from '@/libs/config/env';
import bcrypt from 'bcryptjs';
import { PasswordValidation } from '@/libs/validation/PasswordValidation';

/**
 * Handles the HTTP POST request for reset password.
 *
 * This function checks if a user with the provided email exists,
 * and then initiates the process to send an email for password reset.
 *
 * @param {NextRequest} req - The HTTP request containing the user's email.
 * @returns {NextResponse} - The HTTP response with relevant status and message.
 */
export const POST = async (req: NextRequest) => {
  // Connect to the database
  await dbConnect();

  try {
    // Extract email from the request body
    const payload = await req.json();

    const userValidation = new PasswordValidation();
    userValidation.password = payload.password;
    userValidation.password_confirmation = payload.password_confirmation;

    // Validate user input using class-validator
    const validationErrors = await userValidation.validate();

    if (validationErrors) {
      const errorResponse = sendErrorResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        validationErrors[0],
      );
      return NextResponse.json(errorResponse, { status: StatusCodes.UNPROCESSABLE_ENTITY });
    }

    // Decrypt the email using the secret key
    const crypter = new Cryptr(Env.SECRET_KEY);
    const email = crypter.decrypt(payload.email);

    // Check if the user exists
    const user = await UserModel.findOne({ email, password_reset_token: payload.signature });

    if (!user) {
      // If user not found, return an unauthorized error response
      const errorResponse = sendErrorResponse(StatusCodes.UNAUTHORIZED, 'User not found');
      return NextResponse.json(errorResponse, { status: StatusCodes.UNAUTHORIZED });
    }

    // Generate a new salt and update the user's password
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(payload.password, salt);

    // Clear the password_reset_token after resetting the password
    user.password_reset_token = null;

    // Save the updated user to the database
    await user.save();

    // Return a success response with an empty object
    const successResponse = sendSuccessResponse({});
    return NextResponse.json(successResponse, { status: StatusCodes.OK });
  } catch (error) {
    console.error(error);

    // Return a JSON response for server error with an appropriate status code
    const errorResponse = sendErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
    return NextResponse.json(errorResponse, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};
