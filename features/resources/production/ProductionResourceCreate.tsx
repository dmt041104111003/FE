"use client";

import { Create, SimpleForm } from "react-admin";
import { makeDailyCode } from "@/features/resources/shared/code";
import { CREATE_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { ProductionCreateToolbar } from "./ProductionCreateToolbar";
import { ProductionFormSections } from "./ProductionFormSections";

export function ProductionResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={FORM_SX}
        defaultValues={{
          code: makeDailyCode("VU"),
          status: "CREATED",
          evidenceFiles: [],
        }}
        toolbar={<ProductionCreateToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Create>
  );
}

