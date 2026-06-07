import * as core from '@actions/core';
import axios from 'axios';

type Headers = {
    'Content-Type': string;
    Authorization: string;
}

interface AnnotationPayload {
    tags: string[];
    text: string;
    dashboardId?: number;
    panelId?: number;
}

export const run = async (): Promise<void> => {
    try {
        const grafanaHost: string = core.getInput('grafanaHost', { required: true });
        const grafanaToken: string = core.getInput('grafanaToken', { required: true });
        const grafanaTags: string[] = core.getInput('grafanaTags').split('\n').filter(x => x !== '');
        const grafanaDashboardID: number | undefined = Number.parseInt(core.getInput('grafanaDashboardID'), 10) || undefined;
        const grafanaPanelID: number | undefined = Number.parseInt(core.getInput('grafanaPanelID'), 10) || undefined;
        const grafanaAnnotationID: number | undefined = Number.parseInt(core.getInput('grafanaAnnotationID'), 10) || undefined;
        const grafanaText: string = core.getInput('grafanaText', { required: grafanaAnnotationID === undefined });

        const headers: Headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${grafanaToken}`,
        };

        if (grafanaAnnotationID === undefined) {
            console.log('Creating a new annotation');

            if ((grafanaDashboardID === undefined) !== (grafanaPanelID === undefined)) {
                throw new Error('Must supply both grafanaDashboardID, grafanaPanelID or none.');
            }

            const payload: AnnotationPayload = {
                tags: grafanaTags,
                text: grafanaText,
            };

            if (grafanaDashboardID !== undefined && grafanaPanelID !== undefined) {
                console.log('Dashboard and panel specified, non-global annotation will be created.');
                payload.dashboardId = grafanaDashboardID;
                payload.panelId = grafanaPanelID;
            }

            console.log('Payload: ' + JSON.stringify(payload));

            const response = await axios.post(`${grafanaHost}/api/annotations`, payload, { headers });
            const annotationId = response.data.id;
            console.log(`Successfully created an annotation with the following id [${annotationId}]`);
            core.setOutput('annotation-id', annotationId);

        } else {
            console.log('Updating the end time of existing annotation');
            console.log(`Updating the 'time-end' of annotation [${grafanaAnnotationID}]`);

            const payload: { timeEnd: number } = { timeEnd: Date.now() };
            await axios.patch(`${grafanaHost}/api/annotations/${grafanaAnnotationID}`, payload, { headers });
            console.log('Successfully updated the annotation with time-end');
        }
    } catch (err) {
        core.setFailed(err instanceof Error ? err.message : String(err));
    }
};

if (require.main === module) {
    run();
}
