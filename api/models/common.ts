import { Request } from 'express';

export type BaseRequest<T> = Omit<Request,'body'> & {
    body: T;
};
