import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SaveStatus = 'saved' | 'saving' | 'error';

interface UiState {
  saveStatus: SaveStatus;
  createDocumentModalOpen: boolean;
}

const initialState: UiState = {
  saveStatus: 'saved',
  createDocumentModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload;
    },

    openCreateDocumentModal(state) {
      state.createDocumentModalOpen = true;
    },

    closeCreateDocumentModal(state) {
      state.createDocumentModalOpen = false;
    },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;