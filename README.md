# IceBreakU - Video Chat Application

IceBreakU is a real-time video chat application that matches users based on shared interests. It's built with Node.js, Express, Socket.io, and WebRTC.

## Features

- Interest-based matching
- Real-time video and text chat
- WebRTC peer-to-peer connection
- Ability to leave chat and find new matches

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/icebreaku.git
   cd icebreaku
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000`

## How to Use

1. Enter your interests in the input field, separated by commas (e.g., "music, sports, travel").

2. Click the "Break the Ice" button to find a match.

3. When a match is found, you'll be connected to a video chat with someone who shares at least one of your interests.

4. Use the text chat feature to send messages.

5. To leave the current chat, click the "Leave Chat" button.

6. To find a new match, click the "Find New Match" button.

## Development

To run the application in development mode with auto-restart on file changes, use the following command:
```
npm run dev
```

This will start the server using `nodemon`, which watches for file changes and automatically restarts the server.

## Contributing

Contributions are welcome! To contribute to IceBreakU, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, feel free to open an issue or contact the project maintainers.
