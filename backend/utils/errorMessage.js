const errorMessage = (message, error) => {
  return {
    message,
    error: error.message
  };
};

module.exports = errorMessage;