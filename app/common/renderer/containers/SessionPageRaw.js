import {connect} from 'react-redux';

import * as SessionActions from '../actions/Session';
import SessionRaw from '../components/Session/SessionRaw.jsx';
import {withTranslation} from '../i18next';

function mapStateToProps(state) {
  return state.session;
}

export default withTranslation(SessionRaw, connect(mapStateToProps, SessionActions));
