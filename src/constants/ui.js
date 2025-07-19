// UI Constants for USMLE Trivia App
// Centralizes all user-facing strings for maintainability and i18n readiness

export const MOTIVATIONAL_MESSAGES = [
  "Time to level up your medical knowledge!",
  "Every question brings you closer to your goal!",
  "Ready to ace the USMLE? Let's go!",
  "Knowledge is power - keep building yours!",
  "Another day, another step towards becoming a doctor!",
  "Your future patients are counting on you!",
  "Excellence in medicine starts with preparation!",
  "Transform your study time into success!",
];

export const BUTTON_LABELS = {
  // Auth buttons
  SIGN_UP: "Create Account",
  SIGN_IN: "Sign In",
  FORGOT_PASSWORD: "Forgot Password",
  RESET_PASSWORD: "Reset Password",
  CREATING_ACCOUNT: "Creating Account...",
  SIGNING_IN: "Signing In...",
  SENDING_RESET: "Sending Reset Link...",

  // Quiz buttons
  START_QUIZ: "Start Quiz",
  NEXT_QUESTION: "Next Question",
  SUBMIT_ANSWER: "Submit Answer",
  VIEW_EXPLANATION: "View Explanation",
  TRY_AGAIN: "Try Again",
  GO_HOME: "Go Home",
  CONTINUE: "Continue",

  // Navigation
  BACK: "Back",
  SKIP: "Skip",
  FINISH: "Finish",
  SAVE: "Save",
  CANCEL: "Cancel",
};

export const ARIA_LABELS = {
  // Header controls
  MENU_TOGGLE: "Toggle navigation menu",
  THEME_TOGGLE: "Toggle dark mode",
  NOTIFICATIONS: "View notifications",
  PROFILE_MENU: "Open profile menu",
  CURRENT_POINTS: (points) => `Current points: ${points}`,

  // Quiz interface
  QUIZ_OPTION: (index, text) => `Option ${index + 1}: ${text}`,
  QUIZ_PROGRESS: (current, total) => `Question ${current} of ${total}`,
  QUIZ_TIMER: (timeLeft) => `Time remaining: ${timeLeft}`,
  QUIZ_EXPLANATION: "Explanation for this answer",

  // Navigation
  NAV_HOME: "Go to home page",
  NAV_QUIZ: "Go to quiz selection",
  NAV_LEARN: "Go to learning section",
  NAV_LEADERBOARD: "View leaderboard",
  NAV_PROFILE: "View profile",

  // Interactive elements
  CARD_INTERACTIVE: (title) => `Select ${title} category`,
  TOGGLE_PASSWORD: "Toggle password visibility",
  CLOSE_MODAL: "Close modal",
  EXPAND_SECTION: "Expand section",
};

export const PLACEHOLDER_TEXT = {
  // Form inputs
  EMAIL: "Enter your email address",
  PASSWORD: "Enter your password",
  CONFIRM_PASSWORD: "Confirm your password",
  FULL_NAME: "Enter your full name",
  USERNAME: "Choose a username",
  SEARCH: "Search questions or topics",

  // Quiz interface
  ANSWER_INPUT: "Type your answer here",
  FEEDBACK: "Share your feedback",
};

export const ALT_TEXT = {
  // Default images
  PROFILE_AVATAR: "User profile picture",
  CATEGORY_ICON: (category) => `${category} medical specialty icon`,
  QUIZ_IMAGE: (questionId) => `Medical diagram for question ${questionId}`,
  LEADERBOARD_AVATAR: (username) => `${username}'s profile picture`,

  // App branding
  APP_LOGO: "USMLE Trivia App logo",
  MEDICAL_ICON: "Medical stethoscope icon",

  // Generic fallbacks
  LOADING_IMAGE: "Content loading",
  ERROR_IMAGE: "Failed to load image",
  PLACEHOLDER_IMAGE: "Image placeholder",
};

export const LOADING_MESSAGES = {
  // General loading
  LOADING: "Loading...",
  PLEASE_WAIT: "Please wait...",

  // Specific actions
  LOADING_QUESTIONS: "Loading questions...",
  LOADING_PROFILE: "Loading your profile...",
  LOADING_LEADERBOARD: "Loading leaderboard...",
  LOADING_RESULTS: "Calculating your results...",
  SAVING_PROGRESS: "Saving your progress...",

  // Network actions
  CONNECTING: "Connecting to server...",
  SYNCING: "Syncing your data...",
  UPLOADING: "Uploading content...",
};

export const ERROR_MESSAGES = {
  // Network errors
  CONNECTION_ERROR: "Unable to connect. Please check your internet connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",

  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_NOT_FOUND: "No account found with this email address.",
  PASSWORD_TOO_WEAK: "Password must be at least 8 characters long.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",

  // Quiz errors
  QUESTION_LOAD_ERROR: "Failed to load questions. Please try again.",
  ANSWER_SUBMIT_ERROR: "Failed to submit answer. Your progress has been saved.",

  // Generic errors
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  FEATURE_UNAVAILABLE: "This feature is temporarily unavailable.",
};

export const SUCCESS_MESSAGES = {
  // Authentication
  ACCOUNT_CREATED: "Account created successfully! Welcome to USMLE Trivia!",
  LOGIN_SUCCESS: "Welcome back!",
  PASSWORD_RESET_SENT: "Password reset link sent to your email.",
  PASSWORD_UPDATED: "Password updated successfully.",

  // Quiz completion
  QUIZ_COMPLETED: "Quiz completed! Great job!",
  PROGRESS_SAVED: "Your progress has been saved.",
  ANSWER_CORRECT: "Correct! Well done!",

  // Profile updates
  PROFILE_UPDATED: "Profile updated successfully.",
  SETTINGS_SAVED: "Settings saved successfully.",
};

// Responsive breakpoints for consistent use
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};

// Animation durations for consistency
export const ANIMATION_DURATIONS = {
  FAST: 200,
  DEFAULT: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Common z-index values
export const Z_INDEX = {
  DROPDOWN: 10,
  STICKY: 20,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOAST: 60,
  TOOLTIP: 70,
};
