# Family Finance Manager

A comprehensive family finance management tool built with Next.js and TypeScript. This application helps families track expenses, income, savings, and provides future financial predictions.

## Features

- **Dashboard**: Overview of income and expenses with charts and summaries
- **Expense Management**: Track and categorize expenses with receipt image uploads
- **Income Management**: Record income from various sources
- **Savings Tracking**: Monitor savings in Japanese and Philippines accounts
- **Future Predictions**: View financial projections based on current trends

## Tech Stack

- **Frontend**: Next.js 15.2.2 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/family-finance.git
   cd family-finance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/app`: Next.js App Router pages
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and database connection
- `/src/models`: MongoDB models

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository to Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
