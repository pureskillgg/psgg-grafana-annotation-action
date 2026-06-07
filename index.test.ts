import { run } from './index';
import axios from "axios";
import * as core from "@actions/core";

jest.mock("axios");
const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
const mockedAxiosPatch = axios.patch as jest.MockedFunction<typeof axios.patch>;
jest.spyOn(core, 'setFailed').mockImplementation(() => {});

const INPUT_VARS = [
    'INPUT_GRAFANAHOST',
    'INPUT_GRAFANATOKEN',
    'INPUT_GRAFANATEXT',
    'INPUT_GRAFANATAGS',
    'INPUT_GRAFANADASHBOARDID',
    'INPUT_GRAFANAPANELID',
    'INPUT_GRAFANAANNOTATIONID',
];

afterEach(() => {
    jest.clearAllMocks();
    INPUT_VARS.forEach(v => delete process.env[v]);
});

describe('Grafana Annotation Action Tests', () => {

    // ************************ Input Validation Tests ****************************************
    // ****************************************************************************************
    test('Input Validation: missing all required params', async () => {
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaHost', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaToken', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Input Validation: supplied grafanaText, satisfied minimum required', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        mockedAxiosPost.mockResolvedValueOnce({ status: 200, data: { id: 1 } });
        await run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: [],
            text: 'something',
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });


    // ************************ Create Annotation Tests ***************************************
    // ****************************************************************************************
    test('Create Annotation: global annotation with tags', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        process.env.INPUT_GRAFANATAGS = 'tag:something\ntag2:something';
        mockedAxiosPost.mockResolvedValueOnce({ status: 200, data: { id: 1 } });
        await run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: ['tag:something', 'tag2:something'],
            text: 'something',
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for dashboard but no panel specified', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        process.env.INPUT_GRAFANADASHBOARDID = '12345';
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for panel but no dashboard specified', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        process.env.INPUT_GRAFANAPANELID = '12345';
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('Create Annotation: new annotation for panel and dashboard', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANATEXT = 'something';
        process.env.INPUT_GRAFANATAGS = 'tag:something\ntag2:something';
        process.env.INPUT_GRAFANADASHBOARDID = '12345';
        process.env.INPUT_GRAFANAPANELID = '12345';
        mockedAxiosPost.mockResolvedValueOnce({ status: 200, data: { id: 1 } });
        await run();
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(expect.anything(), {
            tags: ['tag:something', 'tag2:something'],
            text: 'something',
            dashboardId: 12345,
            panelId: 12345,
        }, expect.anything());
        expect(axios.patch).not.toHaveBeenCalled();
    });


    // ************************ Annotation Update Tests ***************************************
    // ****************************************************************************************
    test('Update Annotation: update', async () => {
        process.env.INPUT_GRAFANAHOST = 'something';
        process.env.INPUT_GRAFANATOKEN = 'something';
        process.env.INPUT_GRAFANAANNOTATIONID = '12345';
        mockedAxiosPatch.mockResolvedValueOnce({ status: 200 });
        await run();
        expect(axios.post).not.toHaveBeenCalled();
        expect(axios.patch).toHaveBeenCalledTimes(1);
        expect(axios.patch).toHaveBeenCalledWith(expect.anything(), { timeEnd: expect.any(Number) }, expect.anything());
    });
});
