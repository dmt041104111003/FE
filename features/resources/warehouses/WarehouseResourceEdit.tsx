"use client";

import { Edit, required, SimpleForm, TextInput } from "react-admin";
import { EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";

export function WarehouseResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
      >
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <TextInput source="location" label="Vị trí kho" validate={[required()]} fullWidth />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Edit>
  );
}
