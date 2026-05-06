"use client";

import { Create, required, SimpleForm, TextInput } from "react-admin";
import { CREATE_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";

export function WarehouseResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm sx={FORM_SX}>
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <TextInput source="location" label="Vị trí kho" validate={[required()]} fullWidth />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Create>
  );
}
