import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { UserModel } from '@/libs/models/user.model';
import dbConnect from '@/libs/dbConnect';
import { sendSuccessResponse, sendErrorResponse } from '@/libs/response';
import cryptoRandomString from 'crypto-random-string';
import Cryptr from 'cryptr';
import Env from '@/libs/config/env';
import { render } from '@react-email/render';
import ForgotPasswordEmail from '@/emails/ForgotPasswordEmail';
import { sendEmail } from '@/libs/config/mail';

/**
 * Handles the HTTP POST request for forgot password.
 *
 * This function checks if a user with the provided email exists,
 * and then initiates the process to send an email for password reset.
 *
 * @param {Request} req - The HTTP request containing the user's email.
 * @returns {NextResponse} - The HTTP response with relevant status and message.
 */
export const POST = async (req: Request) => {
  await dbConnect();

  try {
    // Extract email from the request body
    const { email } = await req.json();

    // Check if the user exists
    const user = await UserModel.findOne({ email, provider: 'credentials' });

    if (!user) {
      // If user not found, return an unauthorized error response
      const errorResponse = sendErrorResponse(StatusCodes.UNAUTHORIZED, 'User not found');
      return NextResponse.json(errorResponse, { status: StatusCodes.UNAUTHORIZED });
    }

    // Now create crypto random string for reset token

    const randomString = cryptoRandomString({
      length: 64,
      type: 'alphanumeric',
    });

    user.password_reset_token = randomString;
    await user.save();

    // * Encrypt user email
    const crypt = new Cryptr(Env.SECRET_KEY);
    const encryptedEmail = crypt.encrypt(user.email);

    const url = `${Env.APP_URL}/auth/reset-password/${encryptedEmail}?signature=${randomString}`;

    try {
      const html = render(
        ForgotPasswordEmail({
          params: {
            name: user.name,
            url: url,
          },
        }),
      );
      // Send email to the user
      await sendEmail(email, 'Reset Password', html);

      const successResponse = sendSuccessResponse(user);
      return NextResponse.json(successResponse, { status: StatusCodes.OK });
    } catch (error) {
      console.error(error);
      // Return a JSON response for server error with an appropriate status code
      const errorResponse = sendErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
      return NextResponse.json(errorResponse, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  } catch (error) {
    console.error(error);

    // Return a JSON response for server error with an appropriate status code
    const errorResponse = sendErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
    return NextResponse.json(errorResponse, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
};
