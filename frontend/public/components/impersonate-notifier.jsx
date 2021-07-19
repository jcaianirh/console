import * as React from 'react';
import { connect } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';

import * as UIActions from '../actions/ui';

export const ImpersonateNotifier = connect(({ UI }) => ({ impersonate: UI.get('impersonate') }), {
  stopImpersonate: UIActions.stopImpersonate,
})(({ stopImpersonate, impersonate }) => {
  const { t } = useTranslation();
  if (!impersonate) {
    return null;
  }
  return (
    <div className="co-global-notification">
      <div className="co-global-notification__content">
        <p className="co-global-notification__text">
          <span className="text-uppercase co-global-notification__impersonate-kind">
            {t('public~Impersonating {{kind}}', { kind: impersonate.kind })}
          </span>{' '}
          <Trans t={t} ns="public">
            You are impersonating{' '}
            <span className="co-global-notification__impersonate-name">{impersonate.name}</span>.
            You are viewing all resources and roles this {impersonate.kind.toLowerCase()} can
            access.{' '}
          </Trans>
          <a onClick={stopImpersonate}>{t('public~Stop impersonation')}</a>
        </p>
      </div>
    </div>
  );
});
