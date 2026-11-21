import type { format } from '@fragaria/address-formatter';

declare module '@fragaria/address-formatter' {
  const addressFormatter: { readonly format: typeof format };
  export default addressFormatter;
}
