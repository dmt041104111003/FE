"use client";

import { TextField } from "@mui/material";
import {
  ArrayInput,
  FieldTitle,
  FormDataConsumer,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useInput,
  useSimpleFormIteratorItem,
} from "react-admin";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { parseStringList } from "@/features/core/metadata/share/parseStringList";
import {
  BOX_QUANTITY_MAX,
  BOX_QUANTITY_MIN,
  positiveIntegerMax100,
  positiveNumber,
} from "@/features/resources/shared/numberHelpers";
import {
  EMPTY_PARTICIPANT_ROW,
  normalizeParticipantRow,
  splitLocationLabel,
  toLocationLabel,
} from "@/features/resources/shared/locationHelpers";
import { useContainerFormSections } from "@/hooks/useContainerFormSections";
import { useAdministrativeArea } from "@/hooks/useAdministrativeArea";

function ParticipantAdministrativeAreaFields({
  index,
  disabled = false,
}: {
  index: number;
  disabled?: boolean;
}) {
  const { choices, provinceId, districtId } = useAdministrativeArea(
    `participantRows.${index}.provinceId`,
    `participantRows.${index}.districtId`,
  );

  return (
    <>
      <SelectInput source="provinceId" label="Tỉnh/Thành" choices={choices.provinces} optionValue="id" optionText="name" validate={[required()]} disabled={disabled} fullWidth />
      <SelectInput source="districtId" label="Quận/Huyện" choices={choices.districts} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !provinceId} fullWidth />
      <SelectInput source="wardId" label="Phường/Xã" choices={choices.wards} optionValue="id" optionText="name" validate={[required()]} disabled={disabled || !districtId} fullWidth />
    </>
  );
}

export function parseParticipantRows(record: any) {
  const wallets = parseStringList(record?.participantWalletAddresses);
  const locations = parseStringList(record?.participantLocationLabels);
  return {
    ...record,
    participantRows: wallets.length
      ? wallets.map((wallet, index) => ({
          walletAddress: wallet,
          ...splitLocationLabel(locations[index]),
        }))
      : [{ ...EMPTY_PARTICIPANT_ROW }],
  };
}

export function buildParticipantPayload(rowsRaw: unknown) {
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  const participantRows = rows.map(normalizeParticipantRow).filter((row: any) => row.walletAddress);
  return {
    participantWalletAddresses: participantRows.map((row: any) => row.walletAddress),
    participantLocationLabels: participantRows.map(toLocationLabel),
    participantRows,
  };
}

function BoxQuantityInput({ disabled = false }: { disabled?: boolean }) {
  const { field, fieldState, id, isRequired } = useInput({
    source: "boxQuantity",
    validate: [required(), positiveIntegerMax100],
  });

  const applyInput = (raw: string) => {
    if (raw === "") {
      field.onChange("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    const n = parseInt(raw, 10);
    if (n < BOX_QUANTITY_MIN || n > BOX_QUANTITY_MAX) return;
    field.onChange(n);
  };

  return (
    <TextField
      id={id}
      label={<FieldTitle label="Số lượng thùng" source="boxQuantity" isRequired={isRequired} />}
      type="text"
      inputMode="numeric"
      value={field.value === undefined || field.value === null ? "" : String(field.value)}
      onChange={(e) => applyInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E" || e.key === ".") {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        applyInput(e.clipboardData.getData("text").trim());
      }}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
      disabled={disabled}
      fullWidth
    />
  );
}

function ParticipantRow({
  disabled = false,
  creatorRowLocked = false,
}: {
  disabled?: boolean;
  creatorRowLocked?: boolean;
}) {
  const { index } = useSimpleFormIteratorItem();
  const rowDisabled = disabled || (creatorRowLocked && index === 0);
  return (
    <>
      <TextInput source="walletAddress" label="Địa chỉ ví" validate={[required()]} disabled={rowDisabled} fullWidth />
      <ParticipantAdministrativeAreaFields index={index} disabled={rowDisabled} />
    </>
  );
}

export function ContainerFormSections({
  participantsReadOnly = true,
  showBoxQuantity = false,
}: {
  participantsReadOnly?: boolean;
  showBoxQuantity?: boolean;
}) {
  const { storageLocked, productionChoices, creatorRowLocked } = useContainerFormSections();
  const formLocked = storageLocked;
  const participantLocked = participantsReadOnly || storageLocked;

  return (
    <MilSection index={1} title="Thông tin thùng hàng">
      <MilGrid>
        {showBoxQuantity ? <BoxQuantityInput disabled={formLocked} /> : null}
        <SelectInput source="containerType" label="Loại thùng" choices={[{ id: "CARTON", name: "Carton" }, { id: "PALLET_BOX", name: "Pallet box" }, { id: "PLASTIC_CONTAINER", name: "Container nhựa" }]} optionValue="id" optionText="name" validate={[required()]} disabled={formLocked} fullWidth />
        <TextInput source="weightPerBoxKg" label="Khối lượng mỗi thùng (kg)" type="number" validate={[required(), positiveNumber]} disabled={formLocked} fullWidth />
        <TextInput source="productName" label="Tên sản phẩm" validate={[required()]} disabled={formLocked} fullWidth />
        <SelectInput source="productionInventoryKey" label="Liên kết vụ mùa" choices={productionChoices} optionValue="id" optionText="name" validate={[required()]} disabled={formLocked} fullWidth />
        <div className="md:col-span-2">
          <ArrayInput source="participantRows" label="Đơn vị tham gia chuỗi">
            <SimpleFormIterator disableReordering disableAdd={participantLocked} disableRemove={participantLocked}>
              <FormDataConsumer>
                {() => <ParticipantRow disabled={participantLocked} creatorRowLocked={creatorRowLocked} />}
              </FormDataConsumer>
            </SimpleFormIterator>
          </ArrayInput>
        </div>
        <div className="md:col-span-2">
          <TextInput source="note" label="Ghi chú" multiline minRows={3} disabled={formLocked} fullWidth />
        </div>
      </MilGrid>
    </MilSection>
  );
}
