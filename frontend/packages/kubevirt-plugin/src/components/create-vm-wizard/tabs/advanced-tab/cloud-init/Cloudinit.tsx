import * as React from 'react';
import yamlParser from 'js-yaml';
import { isEmpty, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: FIXME missing exports due to out-of-sync @types/react-redux version
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import useCloudinitValidations from '../../../../../hooks/use-cloudinit-validations';
import useSSHKeys from '../../../../../hooks/use-ssh-keys';
import {
  CloudInitDataFormKeys,
  CloudInitDataHelper,
} from '../../../../../k8s/wrapper/vm/cloud-init-data-helper';
import { iGetIn } from '../../../../../utils/immutable';
import FormWithEditor, {
  EditorPosition,
  FieldsMapper,
  ViewComponent,
} from '../../../../form-with-editor/FormWithEditor';
import { iGetCloudInitNoCloudStorage } from '../../../selectors/immutable/storage';
import { cloudinitFormChildren } from './CloudinitForm';
import CloudinitFormOrYamlSelector from './CloudinitFormOrYamlSelector';
import CloudInitInfoHelper from './CloudinitInfoHelper';
import { onDataChanged } from './utils/cloudinit-utils';
import './cloud-init.scss';

const fieldsMapper: FieldsMapper = {
  'cloudint-password': { path: 'password' },
  'cloudint-user': { path: 'user' },
  'cloudint-hostname': { path: 'hostname' },
  '^cloudint-ssh_authorized_keys-key-[0-9]*$': {
    path: 'ssh_authorized_keys',
    isArray: true,
  },
};

type CloudinitProps = {
  wizardReduxID: string;
};

const Cloudinit: React.FC<CloudinitProps> = ({ wizardReduxID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { iCloudInitStorage } = useSelector((state: RootStateOrAny) => ({
    iCloudInitStorage: iGetCloudInitNoCloudStorage(state, wizardReduxID),
  }));
  const [cloudinitConfigUserData, isBase64] = React.useMemo(
    () =>
      CloudInitDataHelper.getUserData(
        iGetIn(iCloudInitStorage, ['volume', 'cloudInitNoCloud'])?.toJS(),
      ),
    [iCloudInitStorage],
  );
  const cloudinitConfigDataHelper = React.useMemo(
    () => new CloudInitDataHelper({ userData: cloudinitConfigUserData }),
    [cloudinitConfigUserData],
  );
  const { tempSSHKey } = useSSHKeys();
  const { validationSchema, validationStatus, isValid } = useCloudinitValidations(wizardReduxID);
  const [yaml, setYaml] = React.useState<string>();
  const [yamlAsJS, setYamlAsJS] = React.useState<{ [key: string]: any }>();
  const [view, setView] = React.useState<ViewComponent>(ViewComponent.form);
  const [isYamlValid, setIsYamlValid] = React.useState<boolean>(true);

  const setAuthKeys = React.useCallback(
    (fn) =>
      setYaml((data) => {
        try {
          const loadedYaml = yamlParser?.load(data);
          const keys = fn instanceof Function ? fn(loadedYaml?.ssh_authorized_keys) : fn;
          // eslint-disable-next-line @typescript-eslint/naming-convention
          return yamlParser.dump({ ...loadedYaml, ssh_authorized_keys: keys });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e?.message);
        }
        return data;
      }),
    [setYaml],
  );

  const authKeys = React.useMemo(() => yamlAsJS?.ssh_authorized_keys || [''], [yamlAsJS]);

  React.useEffect(() => {
    if (cloudinitConfigDataHelper && !yaml) {
      if (tempSSHKey) {
        cloudinitConfigDataHelper.set(CloudInitDataFormKeys.SSH_AUTHORIZED_KEYS, [tempSSHKey]);
      }
      setYaml(cloudinitConfigDataHelper.getUserData());
    }
  }, [cloudinitConfigDataHelper, tempSSHKey, yaml]);

  React.useEffect(() => {
    if (view === ViewComponent.editor) {
      try {
        const nonEmptyKeys = yamlAsJS?.ssh_authorized_keys?.filter((key: string) => !isEmpty(key));
        const loadedYaml = yamlParser?.load(yaml);
        if (!isEmpty(nonEmptyKeys)) {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          loadedYaml.ssh_authorized_keys = nonEmptyKeys;
        } else {
          delete loadedYaml?.ssh_authorized_keys;
        }
        setYaml(yamlParser.dump(loadedYaml));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e?.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  React.useEffect(() => {
    validationSchema(yamlAsJS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlAsJS]);

  React.useEffect(() => {
    yaml &&
      isValid &&
      isYamlValid &&
      onDataChanged(yaml, isBase64, iCloudInitStorage, wizardReduxID, dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, yaml, isYamlValid]);

  const onChange = React.useCallback(
    (yamlData, yamlAsJSData) => {
      yamlAsJSData && !isEqual(yamlAsJSData, yamlAsJS) && setYamlAsJS(yamlAsJSData);
      yamlData && !isEqual(yamlData, yaml) && setYaml(yamlData);
    },
    [yaml, yamlAsJS],
  );

  return (
    <>
      <div className="kv-cloudinit-advanced-tab-with-editor--title_main">
        <CloudinitFormOrYamlSelector view={view} setView={setView} />
      </div>
      <CloudInitInfoHelper />
      <div className="kv-cloudinit-advanced-tab-with-editor--main">
        <FormWithEditor
          data={yaml}
          onChange={onChange}
          fieldsMapper={fieldsMapper}
          editorPosition={EditorPosition.left}
          classNameForm="kv-cloudinit-advanced-tab-with-editor--form"
          view={view}
          alertTitle={t('kubevirt-plugin~Yaml structure is broken')}
          setIsYamlValid={setIsYamlValid}
        >
          {cloudinitFormChildren({ authKeys, setAuthKeys, validationStatus })}
        </FormWithEditor>
      </div>
    </>
  );
};

export default Cloudinit;
