from collections.abc import Iterable

from ..models import Parcel
from ..schemas import Discrepancy

AREA_TOLERANCE = 0.05


def find_discrepancies(parcels: Iterable[Parcel]) -> list[Discrepancy]:
    discrepancies: list[Discrepancy] = []

    for parcel in parcels:
        if parcel.area_sq_m is not None and parcel.recorded_area_sq_m is not None:
            difference = abs(parcel.area_sq_m - parcel.recorded_area_sq_m)
            if difference > parcel.recorded_area_sq_m * AREA_TOLERANCE:
                discrepancies.append(
                    Discrepancy(
                        parcel_id=parcel.id,
                        external_id=parcel.external_id,
                        kind="area_mismatch",
                        message=f"Mapped area differs by {difference:.2f} square metres.",
                        severity="high" if difference > parcel.recorded_area_sq_m * 0.2 else "medium",
                    )
                )

        if parcel.status not in {"active", "inactive", "pending"}:
            discrepancies.append(
                Discrepancy(
                    parcel_id=parcel.id,
                    external_id=parcel.external_id,
                    kind="invalid_status",
                    message=f"Unsupported parcel status: {parcel.status}.",
                    severity="low",
                )
            )

    return discrepancies
