# **App Name**: EconoQuest

## Core Features:

- Policy Decision Interface: Interactive UI with sliders and buttons to allow players to adjust economic policies (tax rates, interest rates, government spending) for each quarter.
- Dynamic Metric Dashboard: Real-time visualization of four interconnected economic metrics (Inflation, Unemployment, GDP, Public Mood) with animated updates and trend indicators after each policy decision.
- Generative AI Hint Tool: An AI-powered Socratic hint system that analyzes player decisions and provides guidance on economic principles, encouraging critical thinking without revealing direct solutions.
- Scenario-Based Simulation Engine: Backend logic to simulate the cascading effects of policy choices on economic metrics over multiple quarters (Q1 to Q4), with randomized starting conditions for replayability.
- Game Progress and Feedback: Visual feedback through animations, graphs, and icons to intuitively communicate the consequences of policy decisions and track scenario progression.
- Wisdom Leaderboard: Display a ranked list of players based on their 'wisdom' score, reflecting economic stability and growth across completed scenarios, with score storage and retrieval via Firestore.
- Scenario Data Management: Storage and retrieval of randomized economic scenarios and player progress in Firestore, allowing for seamless replayability and persistent high scores.

## Style Guidelines:

- Light/Dark Scheme: Dark mode to provide a focused, data-centric, and immersive experience suitable for strategic gameplay and data visualization.
- Primary Color: A deep, rich blue (#2929A3), evoking a sense of data, intellect, and strategic depth. This color is versatile for key UI elements and action items.
- Background Color: A subtle, desaturated dark blue-gray (#2C2C35), maintaining harmony with the primary color while providing a non-distracting canvas for content and data displays.
- Accent Color: A vibrant cyan-turquoise (#62CAEE), chosen to highlight interactive elements, real-time metric changes, and important feedback for clear visibility and modern appeal.
- Headlines and Metric Displays: 'Space Grotesk' (sans-serif) for its modern, slightly techy, and futuristic feel, ideal for conveying numerical data and engaging titles.
- Body Text and General UI: 'Inter' (sans-serif) for its high readability, neutral tone, and objective appearance, suitable for policy descriptions, hint text, and leaderboard entries.
- Animated metric icons/emojis: Utilize clear, concise icons and expressive emojis for immediate visual feedback on metric changes. These should animate smoothly to indicate positive, negative, or stable trends.
- Dashboard layout: A clear, organized dashboard featuring a prominent policy control section on one side and a dynamic metric display area on the other, ensuring policy decisions and their impact are simultaneously visible. Leaderboard and replay controls should be easily accessible.
- Fluid metric animations: Implement smooth, intuitive transitions for metric changes and graph updates, using subtle easing functions to prevent abrupt visual shifts. Animated feedback should clearly illustrate the magnitude and direction of change, enhancing gameplay immersion.