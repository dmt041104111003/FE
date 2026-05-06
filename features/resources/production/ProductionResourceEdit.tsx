"use client";

import { Edit, SimpleForm } from "react-admin";
import { EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { ProductionEditToolbar } from "./ProductionEditToolbar";
import { ProductionFormSections } from "./ProductionFormSections";

export function ProductionResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        toolbar={<ProductionEditToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Edit>
  );
}

