/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray, isObject } from 'radash';
import { table } from 'table';

export const printTable = (data: Record<string, any> | Array<Record<string, any>>, header = 'Result'): void => {
  const content = isObject(data) ? Object.entries(data) : data;
  const wrapped = isArray(content) ? content : [content];

  console.log(
    table(wrapped as any[], {
      header: {
        content: header,
      },
      columnDefault: {
        truncate: 100,
        wrapWord: true,
        // width: 20,
      },
    }),
  );
};
