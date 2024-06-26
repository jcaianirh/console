import { useContext } from 'react';
import { NamespaceContext } from '@console/app/src/components/detect-namespace/namespace';
import { UseActiveNamespace } from '@console/dynamic-plugin-sdk/src/extensions/console-types';

export const useActiveNamespace: UseActiveNamespace = () => {
  const { namespace, setNamespace } = useContext(NamespaceContext);
  return [namespace, setNamespace];
};
