import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import Summary from '../Summary';
import { Row, Column, Spinner } from 'design-system';
import { MAP_META } from '../Map/constants';
import query from '../query';
import { useQuery } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { formatDate, formatDateAbsolute, preprocessTimeseries, parseStateTimeseries } from '../Map/common-functions';
import MapExplorer from '../Map';
import CovidInfo from '../CovidInfo';
import './Home.css';

const mapColumnOptions = {
  size: '12',
  sizeXL: '7'
};

const infoColumnOptions = {
  size: '12',
  sizeXL: '5'
};

const columnOptions = {
  size: '6',
  sizeM: '12',
  sizeXS: '12'
};

const getWorldStats = (data) => {
  const stats = {
    ...data,
    ...{
      active: data.confirmed - data.deaths - data.recovered
    }
  };
  return stats;
};

const Home = () => {
  let history = useHistory();
  const refs = [useRef(), useRef(), useRef()];

  const [states, setStates] = useState([]);
  const [stateDistrictWiseData, setStateDistrictWiseData] = useState({});
  const [stateTestData, setStateTestData] = useState({});
  const [indiaStats, setIndiaStats] = useState({});
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeStateCode, setActiveStateCode] = useState('TT'); // TT -> India
  const [regionHighlighted, setRegionHighlighted] = useState(undefined);
  const [fetched, setFetched] = useState(false);
  const [paddingClass, setPaddingClass] = useState('px-4');

  const { loading, error, data } = useQuery(query.indiaStats);
  const { loading: worldLoading, error: worldError, data: worldData } = useQuery(query.world);

  useEffect(() => {
    if (!loading && data) {
      setStates(data.india.statewise);
      setLastUpdated(data.india.statewise[0].lastupdatedtime);
      const testData = data.tests.reverse();
      const totalTest = data.india.tested[data.india.tested.length - 1];
      testData.push({
        updatedon: totalTest.updatetimestamp.split(' ')[0],
        totaltested: totalTest.totalindividualstested,
        source: totalTest.source,
        state: 'Total' // India
      });
      setStateTestData(testData);
      setStateDistrictWiseData(data.districts);
      const index = data.india.statewise.findIndex((item) => {
        return item.state === 'Total';
      });
      setIndiaStats(data.india.statewise[index]);

      if (window.innerWidth <= 900) {
        setPaddingClass('px-4');
      } else {
        setPaddingClass('px-10');
      }
      setFetched(true);
    }

    function handleResize() {
      if (window.innerWidth <= 900) {
        setPaddingClass('px-4');
      } else {
        setPaddingClass('px-10');
      }
    }
    window.addEventListener('resize', handleResize);
  }, [loading]);

  const onMapHighlightChange = useCallback(({ statecode }) => {
    setActiveStateCode(statecode);
  }, []);

  const drillIndiaCallback = () => {
    history.push('/india');
  };

  const drillWorldCallback = () => {
    history.push('/world');
  };

  return (
    <div className={`py-6 ${paddingClass} Home`}>
      <Row>
        <Column {...mapColumnOptions}>
          <div style={{ padding: '0 8px' }}>
            {fetched && (
              <MapExplorer
                forwardRef={refs[1]}
                mapMeta={MAP_META.India}
                states={states}
                stateDistrictWiseDataV2={stateDistrictWiseData}
                stateTestData={stateTestData}
                regionHighlighted={regionHighlighted}
                onMapHighlightChange={onMapHighlightChange}
                isCountryLoaded={true}
              />
            )}
          </div>
        </Column>
        <Column {...infoColumnOptions}>
          <div style={{ height: '100%', padding: '0 8px' }}>
            <CovidInfo />
          </div>
        </Column>
      </Row>
      <Row>
        <Column {...columnOptions}>
          {worldLoading && (
            <div className="Spinner-container">
              <Spinner size="large" appearance="primary" />
            </div>
          )}
          {!worldLoading && !worldError && worldData && (
            <div style={{ padding: '0 8px' }}>
              <Summary
                entity="world"
                showLink={true}
                stats={getWorldStats(worldData.summary)}
                drillCallback={drillWorldCallback}
              />
            </div>
          )}
        </Column>
        <Column {...columnOptions}>
          {!fetched && (
            <div className="Spinner-container">
              <Spinner size="large" appearance="primary" />
            </div>
          )}
          {fetched && (
            <div style={{ padding: '0 8px' }}>
              <Summary entity="india" showLink={true} stats={indiaStats} drillCallback={drillIndiaCallback} />
            </div>
          )}
        </Column>
      </Row>
    </div>
  );
};

export default Home;