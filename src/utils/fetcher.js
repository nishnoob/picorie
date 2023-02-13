const fetcher = (url, options = {}) => {
  
  return fetch(
    `/api${url}`,
    {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(options.body) || undefined,
    },
  )
    .then(async response => {
        const data = await response.json();
  
        // check for error response
        if (!response.status == 400) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            console.log("error", error);
            // return Promise.reject(error);
        }
        console.log('Success!', data);
        return data;
    })
    .catch(error => {
        console.error('There was an error!', error);
    });
};

export default fetcher;
