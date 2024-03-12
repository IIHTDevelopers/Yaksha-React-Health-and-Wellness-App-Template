import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PatientProfiles from '../components/PatientProfiles';

beforeEach(() => {
    global.fetch = jest.fn((url) =>
        Promise.resolve({
            json: () => {
                if (url.includes('patients')) {
                    return Promise.resolve([
                        { id: 1, name: 'Jane Doe', age: 28, gender: 'Female', healthGoals: ['Improve sleep', 'Reduce stress'] }
                    ]);
                }
                return Promise.resolve([]);
            },
        })
    );
});

afterEach(() => {
    global.fetch.mockClear();
    delete global.fetch;
});

describe('boundary', () => {
    test('PatientProfileComponent boundary renders without crashing', () => {
        render(<PatientProfiles />);
    });

    test('PatientProfileComponent boundary displays heading', async () => {
        render(<PatientProfiles />);
        expect(await screen.findByText('Patients')).toBeInTheDocument();
    });

    test('PatientProfileComponent boundary fetches and displays patient profiles', async () => {
        render(<PatientProfiles />);
        expect(await screen.findByText(/Jane Doe/)).toBeInTheDocument();
    });

    test('PatientProfileComponent boundary form renders for adding a new patient profile', async () => {
        render(<PatientProfiles />);
        await waitFor(() => expect(screen.getByLabelText('Name:')).toBeInTheDocument());
    });

    test('PatientProfileComponent boundary submits a new patient profile', async () => {
        render(<PatientProfiles />);
        fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'John Smith' } });
        fireEvent.click(screen.getByText('Add Patient'));
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    });
});
