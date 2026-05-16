import timeout from 'connect-timeout';

export const requestTimeout = timeout('30s', {
  respond: true,
});