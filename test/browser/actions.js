export async function click(element) {
  await element.waitForExist({ timeout: 5000 });
  await element.click();
}

export async function setValue(field, value) {
  await field.waitForExist({ timeout: 5000 });
  await field.setValue(value);
}

export async function draft() {
  await (await $("aria/new")).waitForExist({ timeout: 5000 });
  await click(await $("aria/new"));
  await (await $("aria/save")).waitForExist({ timeout: 5000 });
}

export async function save() {
  await click(await $("aria/save"));
  try {
    await (await $("aria/save")).waitForExist({ reverse: true, timeout: 5000 });
  } catch {
    await save();
  }
}

export async function name(value) {
  await (await $("aria/add")).waitForExist({ timeout: 5000 });
  await click(await $("aria/add"));
  await (await $("button=Name of the mind")).waitForExist({ timeout: 5000 });
  await click(await $("button=Name of the mind"));
  await setValue(await $("aria/Name of the mind -"), value);
}

export async function createMind(value) {
  await draft();
  await name(value);
  await save();
}

export async function open() {
  await (await $("aria/.")).waitForExist({ timeout: 5000 });
  await click(await $("aria/."));
}

export async function edit() {
  await open();
  await (await $("aria/edit")).waitForExist({ timeout: 5000 });
  await click(await $("aria/edit"));
}

export async function wipe() {
  await open();
  await (await $("aria/delete")).waitForExist({ timeout: 5000 });
  await click(await $("aria/delete"));
  await (await $("aria/yes")).waitForExist({ timeout: 5000 });
  await click(await $("aria/yes"));
  await (await $("aria/delete")).waitForExist({ reverse: true, timeout: 5000 });
}

export async function search() {
  await (await $("aria/search")).waitForExist({ timeout: 5000 });
  await click(await $("aria/search"));
}
