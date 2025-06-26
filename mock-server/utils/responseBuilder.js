function buildResponse(data) {
  return {
    payload: {
      metrics: data.metrics || []
    },
    exception: data.exception || null,
    messages: data.messages || null,
    executionTime: data.executionTime || Math.random() * 2000 + 500
  };
}

function buildErrorResponse(message, code = 'PROCESSING_ERROR', executionTime = null) {
  return {
    payload: {
      metrics: []
    },
    exception: {
      message,
      code
    },
    messages: null,
    executionTime: executionTime || Math.random() * 1000
  };
}

function buildSuccessResponse(metrics) {
  return buildResponse({
    metrics,
    executionTime: Math.random() * 2000 + 500
  });
}

module.exports = {
  buildResponse,
  buildErrorResponse,
  buildSuccessResponse
};