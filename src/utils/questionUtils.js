// Utility functions for processing question text
export const processQuestionText = (text) =>
  text
    ? text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    : '';
