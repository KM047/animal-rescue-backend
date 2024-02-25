# Animal Rescue Backend

The Animal Rescue Backend project signifies a pivotal moment in my backend development journey, where I've explored various technologies and frameworks to construct a robust backend for an animal rescue web application. Leveraging Node.js, Express.js, MongoDB, Mongoose, JWT, Multer, Bcrypt, and Cloudinary, among others, I've built a comprehensive backend to support a feature-rich animal rescue platform.

## Features

### User Authentication:

- Sign up and login functionalities for users.
- Secure user authentication using JWT and bcrypt.

### Animal Management:

- Seamless uploading of animal rescue information.
- Support for updating, deleting, and retrieving animal rescue records.
- Advanced features like categorization, and location tracking.

### Organization Authentication:

- Sign up and login functionalities for org.
- Adding their team members removing members
- Updating the rescue report

## Technologies Used

- **Node.js & Express.js:** The foundation of backend development.
- **MongoDB & Mongoose:** Database management for storing animal rescue data.
- **JWT & Bcrypt:** Ensuring secure user authentication and authorization.
- **Multer & Cloudinary:** Handling image uploads and storage.
- **And More.**

## Configuration

Configure your application using the following environment variables:

- **PORT:** Set to your desired port number.
- **MONGODB_URI:** Set to your MongoDB connection URI.
- **CORS_ORIGIN:** Set to the allowed CORS origin (e.g., `*` for all or specify your frontend domain).
- **ACCESS_TOKEN_SECRET:** Set to a secure string for generating access tokens.
- **ACCESS_TOKEN_EXPIRY:** Set to the desired expiration time for access tokens (e.g., `1d` for one day).
- **REFRESH_TOKEN_SECRET:** Set to a secure string for generating refresh tokens.
- **REFRESH_TOKEN_EXPIRY:** Set to the desired expiration time for refresh tokens (e.g., `10d` for ten days).

### Session and Cookies

Implement a session and cookies system where necessary for user authentication and authorization.

### Cloudinary Configuration

For Cloudinary integration:

- **CLOUDINARY_CLOUD_NAME:** Set to your Cloudinary cloud name.
- **CLOUDINARY_API_KEY:** Set to your Cloudinary API key.
- **CLOUDINARY_API_SECRET:** Set to your Cloudinary API secret.

Ensure to set these environment variables in your deployment environment or provide a `.env` file for local development.

## Postman Link

[Link to Postman Documentation](https://documenter.getpostman.com/view/29591684/2sA2rCVNDN)

## Model Link

[Link to ER Diagram](https://app.eraser.io/workspace/YhL06Vj8mdoPebW75rVL?origin=share)

## Learning Journey

This project showcases my dedication to learning, inspired by various resources and mentors. I've invested time in understanding fundamental concepts and advanced techniques to build this backend. Special thanks to all mentors and learning platforms that have contributed to my growth.

## Contributing

Contributions are welcome! If you'd like to contribute to the Animal Rescue Backend, please adhere to the following guidelines:

- **Bug Reports:** Open an issue with a clear description and steps to reproduce.
- **Feature Requests:** Submit an issue with detailed specifications.
- **Pull Requests:** Fork the repository, create a new branch, make changes, and submit a pull request.

Thank you for your contributions!

## Future Developments

This project is a work in progress, and there are plans to enhance it further based on user feedback and emerging requirements. Future developments may include additional features for better animal management, improved user experience, and scalability enhancements.

## License

This project is licensed under the MIT License - Chai Aur backend, @Hiteshchoudhary and @KM9110
