'use client';
import { Provider } from 'react-redux';
import store from '@t/redux/store';

export default function Providers({ children }: { children: React.ReactNode }) {
   return <Provider store={store}>{children}</Provider>;
}
