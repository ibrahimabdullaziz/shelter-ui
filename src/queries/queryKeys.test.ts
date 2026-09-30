import { describe, expect, it } from "vitest";
import { bookingKeys } from "./bookingKeys";
import { catalogKeys } from "./catalogKeys";
import { reviewKeys } from "./reviewKeys";
import { unitKeys } from "./unitKeys";

describe("query key hierarchies", () => {
  it("keeps unit lists, owned units, and details under one invalidation root", () => {
    expect(unitKeys.list({ page: 2 })[0]).toBe(unitKeys.all[0]);
    expect(unitKeys.mine().slice(0, unitKeys.all.length)).toEqual(unitKeys.all);
    expect(unitKeys.detail("unit-1").slice(0, unitKeys.all.length)).toEqual(
      unitKeys.all,
    );
  });

  it("groups host and guest bookings under the list prefix", () => {
    expect(bookingKeys.mine().slice(0, bookingKeys.lists().length)).toEqual(
      bookingKeys.lists(),
    );
    expect(bookingKeys.host().slice(0, bookingKeys.lists().length)).toEqual(
      bookingKeys.lists(),
    );
  });

  it("gives catalog and review queries stable domain roots", () => {
    expect(catalogKeys.cities().slice(0, catalogKeys.all.length)).toEqual(
      catalogKeys.all,
    );
    expect(reviewKeys.byUnit("unit-1").slice(0, reviewKeys.all.length)).toEqual(
      reviewKeys.all,
    );
  });
});
