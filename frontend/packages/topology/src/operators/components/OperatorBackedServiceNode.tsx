import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import {
  observer,
  Node,
  WithSelectionProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithContextMenuProps,
} from '@patternfly/react-topology';
import { useTranslation } from 'react-i18next';
import { GroupNode } from '../../components/graph-view';

type OperatorBackedServiceNodeProps = {
  element: Node;
  badge?: string;
  badgeColor?: string;
  badgeClassName?: string;
  droppable?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  editAccess: boolean;
} & WithSelectionProps &
  WithContextMenuProps &
  WithDragNodeProps &
  WithDndDropProps;

const OperatorBackedServiceNode: React.FC<OperatorBackedServiceNodeProps> = ({
  canDrop,
  dropTarget,
  ...rest
}) => {
  const ref = React.useRef();
  const { t } = useTranslation();
  return (
    <Tooltip
      triggerRef={ref}
      content={t('topology~Create Service Binding')}
      trigger="manual"
      isVisible={dropTarget && canDrop}
      animationDuration={0}
      position="top"
    >
      <g ref={ref}>
        <GroupNode bgClassName="odc-operator-backed-service__bg" {...rest} />
      </g>
    </Tooltip>
  );
};

export default observer(OperatorBackedServiceNode);
