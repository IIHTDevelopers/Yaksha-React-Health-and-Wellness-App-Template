import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Meditations from '../components/Meditations';

beforeEach(() => {
    global.fetch = jest.fn((url) =>
        Promise.resolve({
            json: () => {
                if (url.includes('meditation')) {
                    return Promise.resolve([
                        {
                            id: 1,
                            patientId: 1,
                            date: '2024-02-26',
                            sessionLength: '20 minutes',
                            type: 'Guided',
                            focus: 'Mindfulness'
                        }
                    ]);
                }
                return Promise.resolve([]);
            },
        })
    );
});

afterEach(() => {
    global.fetch.mockClear();
});

describe('boundary', () => {
    test('MeditationsComponent boundary renders without crashing', () => {
        render(<Meditations />);
    });

    test('MeditationsComponent boundary displays heading', async () => {
        render(<Meditations />);
        expect(await screen.findByText('Meditation Sessions')).toBeInTheDocument();
    });

    test('MeditationsComponent boundary fetches and displays meditation sessions', async () => {
        render(<Meditations />);
        expect(await screen.findByText(/Patient ID: 1/)).toBeInTheDocument();
    });

    test('MeditationsComponent boundary form renders for adding a new meditation session', async () => {
        render(<Meditations />);
        await waitFor(() => expect(screen.getByLabelText('Patient ID:')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByLabelText('Date:')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByLabelText('Session Length (e.g., 20 minutes):')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByLabelText('Type (e.g., Guided, Unguided):')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByLabelText('Focus (e.g., Mindfulness, Relaxation):')).toBeInTheDocument());
    });

    test('MeditationsComponent boundary submits a new meditation session', async () => {
        render(<Meditations />);
        fireEvent.change(screen.getByLabelText('Patient ID:'), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2024-02-27' } });
        fireEvent.change(screen.getByLabelText('Session Length (e.g., 20 minutes):'), { target: { value: '30 minutes' } });
        fireEvent.change(screen.getByLabelText('Type (e.g., Guided, Unguided):'), { target: { value: 'Guided' } });
        fireEvent.change(screen.getByLabelText('Focus (e.g., Mindfulness, Relaxation):'), { target: { value: 'Relaxation' } });

        fireEvent.click(screen.getByText('Add Meditation Session'));
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2)); // Assuming 1 call for initial fetch, 1 for post
    });
});
