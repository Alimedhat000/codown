import { Request } from 'express';

export const getClientInfo = (req: Request) => {
  let ip = req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || undefined;

  if (ip?.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  console.log(ip);
  return {
    ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
  };
};
