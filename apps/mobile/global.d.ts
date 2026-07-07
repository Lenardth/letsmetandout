declare module 'react-native/Libraries/Core/ExceptionsManager' {
  export function handleException(err: Error, isFatal: boolean): void;
}

declare module 'react-native-web-refresh-control' {
  import type { ComponentType } from 'react';
  import type { RefreshControlProps } from 'react-native';

  export const RefreshControl: ComponentType<RefreshControlProps>;
}
